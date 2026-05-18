const Logger = {
  info: (msg, data) => {
    if (window.DEBUG) console.info("[PP]", msg, data || "");
  },
  error: (msg, err) => console.error("[PP ERROR]", msg, err || ""),
};

window.Logger = Logger;

export default Logger;
