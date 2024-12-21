"use client";
import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { AttachAddon } from "@xterm/addon-attach";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

function TermComp() {
  const termRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const term = new Terminal();
    const fitAddon = new FitAddon();
    let ws: WebSocket;
    if (termRef.current) {
      ws = new WebSocket("http://localhost:5000");
      term.open(termRef.current);
      const attachAddon = new AttachAddon(ws);
      term.loadAddon(attachAddon);
      term.loadAddon(fitAddon);
      fitAddon.fit();
    }
    return () => {
      term.dispose();
      ws.close();
    };
  }, []);
  return <div ref={termRef} className="w-full h-full"></div>;
}

export default TermComp;
