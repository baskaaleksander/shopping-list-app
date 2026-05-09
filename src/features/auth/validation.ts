type SignInValues = {
  email: string;
  password: string;
};

type SignUpValues = SignInValues & {
  username: string;
};

function hasValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email.trim());
}

export function validateSignIn({ email, password }: SignInValues) {
  if (!hasValidEmail(email)) {
    return 'validation.invalidEmail';
  }

  if (password.trim().length < 6) {
    return 'validation.shortPassword';
  }

  return null;
}

export function validateSignUp({ email, password, username }: SignUpValues) {
  if (!username.trim()) {
    return 'validation.requiredUsername';
  }

  return validateSignIn({ email, password });
}
