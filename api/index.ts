import { createServer } from "http";
import app from "../server/_core/index";

const server = createServer(app);

export default server;
