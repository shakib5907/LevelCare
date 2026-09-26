import { co2 } from "@tgwf/co2";

// Sustainable Web Design (SWD) model, same as the frontend widget uses via
// react-carbon-footprint - so both sides estimate emissions the same way.
const co2Emission = new co2({ model: "swd" });

// Set to true only if the backend is actually hosted on a certified green
// host (see thegreenwebfoundation.org/green-web-check) - left false here
// since that hasn't been verified for this deployment.
const GREEN_HOST = false;

/**
 * Estimates CO2 emissions per request from request + response byte size,
 * and logs it. Purely observational - doesn't block or alter the response.
 */
const carbonFootprint = (req, res, next) => {
  let requestBytes = 0;
  let responseBytes = 0;

  if (req.body) requestBytes += Buffer.byteLength(JSON.stringify(req.body), "utf8");
  if (req.query) requestBytes += Buffer.byteLength(JSON.stringify(req.query), "utf8");
  if (req.headers) requestBytes += Buffer.byteLength(JSON.stringify(req.headers), "utf8");

  const originalWrite = res.write;
  const originalEnd = res.end;

  res.write = function (chunk, ...args) {
    if (chunk) responseBytes += Buffer.byteLength(chunk, "utf8");
    return originalWrite.call(res, chunk, ...args);
  };

  res.end = function (chunk, ...args) {
    if (chunk) responseBytes += Buffer.byteLength(chunk, "utf8");

    const totalBytes = requestBytes + responseBytes;
    const emissions = co2Emission.perByte(totalBytes, GREEN_HOST);

    console.log(
      `[carbon] ${req.method} ${req.originalUrl} - ${totalBytes} bytes - ${emissions.toFixed(4)} g CO2eq`,
    );

    return originalEnd.call(res, chunk, ...args);
  };

  next();
};

export default carbonFootprint;