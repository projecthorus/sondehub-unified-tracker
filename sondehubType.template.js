const sondehubTypes = {
  PROFESSIONAL: "Professional",
  AMATEUR: "Amateur",
};
function isProfessional() {
  return sondehubType == sondehubTypes.PROFESSIONAL;
}
function isAmateur() {
  return sondehubType == sondehubTypes.AMATEUR;
}
var sondehubType = sondehubTypes["{TYPE}"];
