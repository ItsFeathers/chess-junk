export function simplifyFen(fen: string) {
  var elements = fen.split(" ");
  var sanitized = elements.slice(0, 3).join(" ");
  return sanitized;
}

export function getPlayerToMove(fen: string) {
  var elements = fen.split(" ");
  return elements[1].trim();    
}