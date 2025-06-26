import {sendLog} from "@pulser/devstral-sdk";
export function trace(event, payload){ sendLog("appgenie", event, payload); }