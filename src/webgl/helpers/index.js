export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

export const getViewportTarget = () => {
  const wW = window.innerWidth;
  if (wW < 1024) {
    return "mobile";
  } else if (wW >= 1024 && wW < 1440) {
    return "tablet";
  } else {
    return "desktop";
  }
};
