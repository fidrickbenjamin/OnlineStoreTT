export const toDominicaLocal = value => value ? new Date(+new Date(value)-4*3600000).toISOString().slice(0,16) : "";
export const fromDominicaLocal = value => value ? new Date(`${value}:00-04:00`).toISOString() : null;
