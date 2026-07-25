import { Outlet, useLocation } from 'react-router-dom';
import { TitleBar } from './TitleBar';
import { ActivityRail } from './ActivityRail';
import { StatusBar } from './StatusBar';
import { Backdrop } from './Backdrop';
import { ToastViewport } from '../../components/ui';
import { ChatbotPanel } from '../../features/chatbot/ChatbotPanel';

/**
 * The IDE frame: title bar on top, activity rail down the side, status bar
 * along the bottom, and a single scrolling work area between them.
 *
 * `bg-base-solid` on the root is the opaque floor the wallpaper sits on;
 * everything above it uses the translucent `--bg-*` tokens so the backdrop
 * shows through at whatever strength the user picked.
 */
export function AppShell() {
  const location = useLocation();

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-base-solid">
      <Backdrop />

      <div className="relative z-10 flex h-full flex-col">
        <TitleBar />
        <div className="flex min-h-0 flex-1">
          <ActivityRail />
          <main className="themed-scrollbar min-w-0 flex-1 overflow-y-auto bg-base">
            {/* Keyed on pathname so each navigation replays the entrance
                animation instead of swapping content with no transition. */}
            <div key={location.pathname} className="h-full animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
        <StatusBar />
      </div>

      <ChatbotPanel />
      <ToastViewport />
    </div>
  );
}
