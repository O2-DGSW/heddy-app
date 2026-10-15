type ClassValueType = string | false | null | undefined;

const cn = (...classValues: ClassValueType[]) => {
  return classValues.filter(Boolean).join(" ");
};

export default cn;
