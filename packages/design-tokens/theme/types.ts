export interface Theme {
  primary: {
    normal: string;
  };
  label: {
    normal: string;
    strong: string;
    neutral: string;
    alternative: string;
    assistive: string;
    inactive: string;
    disable: string;
    buttonText: string;
  };
  line: {
    normal: string;
    neutral: string;
    alternative: string;
  };
  fill: {
    normal: string;
    neutral: string;
    alternative: string;
  };
  background: {
    normal: string;
    neutral: string;
    alternative: string;
  };
  status: {
      error: string;
      warning: string;
      success: string;
      info: string;
  }
}
