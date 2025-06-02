// C:\Users\zhass\Desktop\workspace\express-ws-app\src\types\express-ws.ts
import * as express from 'express';
import * as WebSocket from 'ws';

declare module 'express-serve-static-core' {
  interface Express {
    ws: (route: string, handler: (ws: WebSocket, req: express.Request) => void) => void;
  }

  interface Router {
    ws: (route: string, handler: (ws: WebSocket, req: express.Request) => void) => void;
  }
}