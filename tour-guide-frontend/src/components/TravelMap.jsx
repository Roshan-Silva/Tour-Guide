import { CircleMarker, MapContainer, Polyline, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function TravelMap({ points = [], height = '360px', showRoute = false }) {
  const valid = points.filter((point) => Number.isFinite(Number(point.latitude)) && Number.isFinite(Number(point.longitude)));
  if (!valid.length) return <div className="grid rounded-3xl bg-slate-100 text-sm text-slate-500" style={{ height }}>Map coordinates are not available yet.</div>;
  const positions = valid.map((point) => [Number(point.latitude), Number(point.longitude)]);
  return <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm" style={{ height }}><MapContainer center={positions[0]} zoom={valid.length > 1 ? 7 : 11} scrollWheelZoom={false} className="h-full w-full" aria-label="Destination map"><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />{showRoute && positions.length > 1 && <Polyline positions={positions} pathOptions={{ color: '#0f766e', weight: 4, dashArray: '8 8' }} />}{valid.map((point, index) => <CircleMarker key={`${point.name}-${index}`} center={positions[index]} radius={9} pathOptions={{ color: '#fff', fillColor: '#0f766e', fillOpacity: 1, weight: 3 }}><Popup><b>{showRoute ? `Day ${index + 1}: ` : ''}{point.name}</b>{point.location && <><br />{point.location}</>}</Popup></CircleMarker>)}</MapContainer></div>;
}
