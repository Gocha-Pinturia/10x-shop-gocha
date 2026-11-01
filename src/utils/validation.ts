export function validateLogin(username: string, password: string): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!username.trim()) {
    errors.username = "Username is required";
  }
  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }
  return errors;
}

export function validateCheckout(values: {
  fullName: string;
  email: string;
  address: string;
  city: string;
  phone?: string;
  postalCode?: string;
  country?: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.fullName.trim() || values.fullName.trim().length < 3) {
    errors.fullName = "Full name must be at least 3 characters";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!values.email.trim() || !emailRegex.test(values.email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  if (!values.address.trim() || values.address.trim().length < 5) {
    errors.address = "Address must be at least 5 characters";
  }

  if (!values.city.trim()) {
    errors.city = "City is required";
  }

  if (values.phone !== undefined && values.phone.trim()) {
    const phoneDigits = values.phone.replace(/[\s+-]/g, "");
    if (phoneDigits.length < 9 || phoneDigits.length > 15 || !/^\d+$/.test(phoneDigits)) {
      errors.phone = "Please enter a valid phone number";
    }
  }

  if (values.postalCode !== undefined && values.postalCode.trim()) {
    const postalDigits = values.postalCode.trim();
    if (postalDigits.length < 4 || postalDigits.length > 10 || !/^\d+$/.test(postalDigits)) {
      errors.postalCode = "Postal code must be 4-10 digits";
    }
  }

  if (values.country !== undefined && !values.country.trim()) {
    errors.country = "Please select a country";
  }

  return errors;
}

export function validateReview(rating: number, comment: string): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!rating || rating < 1 || rating > 5) {
    errors.rating = "Please select a rating";
  }
  if (!comment.trim() || comment.trim().length < 10) {
    errors.comment = "Comment must be at least 10 characters";
  }
  return errors;
}
