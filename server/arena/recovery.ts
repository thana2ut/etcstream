import "server-only";
import { randomBytes } from "node:crypto";
import { one,run,transaction,limit,requireOnlineSchema,ArenaError } from "./db";
import { digest, issueSession, session } from "./auth";

export function generateRecovery(player:string) {
  requireOnlineSchema();limit("recovery-generate:"+player,3,3600000);
  const credential=randomBytes(32).toString("hex"), now=Date.now(), expires=now+30*86400000;
  transaction(()=>{run("DELETE FROM recovery_credentials WHERE player=?",player);run("INSERT INTO recovery_credentials VALUES(?,?,?,?,NULL)",digest(credential),player,now,expires);});
  // Returned once to the authenticated owner. Never include in profile, audit, or logs.
  return {credential,expires};
}
export async function recoverPlayer(value:unknown) {
  requireOnlineSchema();limit("recovery-global",12,900000);
  if(await session("player")) throw new ArenaError(409,"เบราว์เซอร์นี้มีตัวตนอยู่แล้ว ไม่รวมบัญชีหรือเขียนทับตัวตนเดิม");
  if(typeof value!=="string" || !/^[a-f0-9]{64}$/.test(value)) throw new ArenaError(400,"รหัสกู้คืนไม่ถูกต้องหรือหมดอายุ");
  const id=transaction(()=>{
    const r=one("SELECT r.* FROM recovery_credentials r JOIN players p ON p.id=r.player WHERE r.token_hash=? AND r.consumed IS NULL AND r.expires>? AND p.deleted=0 AND p.suspended=0",digest(value),Date.now());
    if(!r) throw new ArenaError(400,"รหัสกู้คืนไม่ถูกต้องหรือหมดอายุ");
    run("UPDATE recovery_credentials SET consumed=? WHERE token_hash=? AND consumed IS NULL",Date.now(),digest(value));
    // Redeeming a recovery credential revokes previous device sessions.
    run("DELETE FROM sessions WHERE principal=? AND role='player'",r.player);
    return String(r.player);
  });
  await issueSession(id,"player"); return {ok:true};
}
