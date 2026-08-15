export const isValidPhone = (phone: string): boolean =>
  /^\d{3}-\d{4}-\d{4}$/.test(phone);

export const isPasswordMatch = (password: string, confirm: string): boolean =>
  password.length > 0 && password === confirm;