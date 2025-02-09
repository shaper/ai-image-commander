export function renderKittyImage(imageBuffer: Buffer) {
  // Convert the image buffer to a base64-encoded string.
  const base64Image = imageBuffer.toString('base64');

  // Construct the escape sequence.
  // The format is: ESC _ <params> ; <data> ESC \
  // - a=T: transmit
  // - t=d: direct display (temporary image)
  // You can include additional parameters (like width "w", height "h") if needed.
  const kittyEscapeSequence = `\x1b_Ga=T,t=d;${base64Image}\x1b\\`;

  // Output the escape sequence to the terminal.
  console.log(kittyEscapeSequence);
}
