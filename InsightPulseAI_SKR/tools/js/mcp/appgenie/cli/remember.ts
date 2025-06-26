import {remember} from "../packages/appgenie/memory/memory.js";
const [,,key,...rest]=process.argv;
await remember(key, rest.join(" "));