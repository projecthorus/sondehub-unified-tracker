const sondehubTypes = {
  PROFESSIONAL: "Professional",
  AMATEUR: "Amateur",
};
const sondehubType = sondehubTypes["{TYPE}"];
const sondehubTypeName = "{TYPE_NAME}";

function isProfessional() {
  return sondehubType == sondehubTypes.PROFESSIONAL;
}
function isAmateur() {
  return sondehubType == sondehubTypes.AMATEUR;
}