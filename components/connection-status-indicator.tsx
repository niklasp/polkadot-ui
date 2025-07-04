import { cn } from "@/lib/utils";
import { WsEvent } from "polkadot-api/ws-provider/web";

export function ConnectionStatusIndicator({
  status,
  error,
  className,
}: {
  status: WsEvent;
  error: Error | null;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {status === WsEvent.CONNECTED && (
        <span className="bg-green-500 animate-pulse w-2 h-2 rounded-full" />
      )}
      {status === WsEvent.CONNECTING && (
        <span className="bg-yellow-500 animate-pulse w-2 h-2 rounded-full" />
      )}
      {status === WsEvent.ERROR && (
        <span className="bg-red-500 animate-pulse w-2 h-2 rounded-full" />
      )}
    </div>
  );
}
