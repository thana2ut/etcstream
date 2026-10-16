/** Thai feedback for live cable training. */
export const feedbackCopy = {
  training: {
    pickedUp: { title: "Lead picked up", detail: "Aim at a port and press E to plug in" },
    dropped: { title: "Lead set down", detail: "Press E on it to pick it up again" },
    disconnected: { title: "Unplugged", detail: "The plug is in your hand — press F to set it down" },
    invalidTarget: { title: "Nothing to interact with", detail: "Centre a cable end or a port in the reticle" },
    alreadyHolding: { title: "Already holding a lead", detail: "Plug it in or press F to set it down first" },
    pickUpFirst: { title: "No lead in hand", detail: "Aim at a cable end and press E to pick it up" },
    aimHint: "Aim at a cable end or a port and press E",
    pickUpHint: "E · Pick up the lead",
    disconnectHint: "E · Unplug the lead",
  },
  connection: {
    success: { title: "Connected", detail: "Plugged in", technical: "OUTPUT → INPUT" },
    invalidDirection: { title: "Wrong direction", detail: "This connection is not valid", technical: "Signal must travel OUTPUT → INPUT" },
    connectorMismatch: { title: "Connector does not match this port", detail: "Check the cable type" },
    portOccupied: { title: "Port occupied", detail: "Something is already plugged in here" },
    invalidRoute: { title: "Not part of this job", detail: "Re-check the source and the destination" },
  },
  signalTest: { action: "Run signal test", incomplete: { title: "Signal path incomplete", detail: "At least one path does not carry a signal yet" }, complete: { title: "Signal path complete", detail: "The system is live...", status: "SIGNAL ACTIVE" } },
} as const;
