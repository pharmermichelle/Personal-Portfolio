import ArcadeLobby from "../components/ArcadeLobby";

export default function Arcade() {
  return <ArcadeLobby onPlay={(m) => console.log("play", m)} />;
}
