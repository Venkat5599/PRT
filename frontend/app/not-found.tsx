import "./globals.css";
import "./motion.css";
import Nav from "@/components/Nav";

export default function NotFound() {
  return (
    <>
      <Nav base="/" solid />
      <main className="lost">
        <h1>No block <em>at this height.</em></h1>
        <p>This page does not exist. The runtime diff, the endpoint doctor and the recorded runs are one click away.</p>
        <div className="lost-links">
          <a href="/">Home</a>
          <a href="/dashboard">Dashboard</a>
        </div>
      </main>
    </>
  );
}
