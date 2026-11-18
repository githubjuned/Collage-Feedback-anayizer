"""
CampusPulse AI - Unified Application Launcher
Starts both the FastAPI Backend and Vite React Frontend.
"""

import os
import sys
import subprocess
import time
import signal

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

def main():
    print("=" * 70)
    print("  CampusPulse AI – Intelligent College Feedback Analyzer")
    print("  Multilingual NLP Triage Engine (English, Hindi, Marathi)")
    print("=" * 70)

    # 1. Start Backend
    print("\n[1/2] Starting Python FastAPI Backend on http://localhost:8000 ...")
    backend_proc = subprocess.Popen(
        [sys.executable, "run.py"],
        cwd=BACKEND_DIR,
        shell=False
    )

    # Allow backend 2 seconds to initialize DB
    time.sleep(2)

    # 2. Start Frontend
    print("[2/2] Starting Vite Frontend on http://localhost:5173 ...")
    # Using npm run dev or vite preview
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=FRONTEND_DIR,
        shell=False
    )

    print("\n" + "=" * 70)
    print("  Application running successfully!")
    print("  - Student & Admin Web App: http://localhost:5173")
    print("  - FastAPI Interactive Docs: http://localhost:8000/docs")
    print("  - Admin Credentials:")
    print("      Email:    admin@campuspulse.edu")
    print("      Password: admin123")
    print("=" * 70)
    print("Press Ctrl+C to terminate both servers.\n")

    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                print("Backend terminated unexpectedly.")
                break
            if frontend_proc.poll() is not None:
                print("Frontend terminated unexpectedly.")
                break
    except KeyboardInterrupt:
        print("\nShutting down servers...")
    finally:
        backend_proc.terminate()
        frontend_proc.terminate()
        try:
            backend_proc.wait(timeout=3)
            frontend_proc.wait(timeout=3)
        except Exception:
            backend_proc.kill()
            frontend_proc.kill()
        print("Servers stopped cleanly.")

if __name__ == "__main__":
    main()
