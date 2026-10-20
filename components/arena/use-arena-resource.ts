"use client";
import {useEffect,useState} from "react";
import {api} from "./client-api";

// Poll only while visible; retain an explicit stale-data state on a lost connection.
export function useArenaResource<T>(path:string|null,interval=20000) {
  const [revision,setRevision]=useState(0);
  const [state,setState]=useState<{path:string|null;data?:T;error:string;loading:boolean;updated:number}>({path:null,error:"",loading:true,updated:0});
  useEffect(()=>{
    if(!path)return;
    let live=true,failures=0,timer:ReturnType<typeof setTimeout>,controller:AbortController|undefined;
    const fetchData=async()=>{
      clearTimeout(timer);if(document.hidden){timer=setTimeout(fetchData,interval);return;}
      controller?.abort();controller=new AbortController();
      try{const value=await api<T>(path,undefined,false,controller.signal);if(!live)return;failures=0;setState({path,data:value,error:"",loading:false,updated:Date.now()});}
      catch(e){if(!live || (e as Error).name==="AbortError")return;failures++;setState((previous)=>({path,data:previous.path===path?previous.data:undefined,error:(e as Error).message || "เชื่อมต่อระบบไม่ได้",loading:false,updated:previous.path===path?previous.updated:0}));}
      if(live)timer=setTimeout(fetchData,Math.min(120000,interval*2**Math.min(failures,3)));
    };
    const visible=()=>{if(!document.hidden)void fetchData();};
    timer=setTimeout(fetchData,0);document.addEventListener("visibilitychange",visible);
    return()=>{live=false;clearTimeout(timer);controller?.abort();document.removeEventListener("visibilitychange",visible);};
  },[path,interval,revision]);
  const current=state.path===path?state:{path,data:undefined,error:"",loading:Boolean(path),updated:0};
  return {...current,stale:Boolean(current.error && current.data),retry:()=>setRevision((n)=>n+1)};
}
