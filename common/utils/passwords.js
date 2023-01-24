const PASSWORD_POLICY_MIN_LENGTH = 9;
const PASSWORD_POLICY_SPECIAL_CHARACTERS = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/;

export const PASSWORD_POLICY_RULES = [
  {
    message: `${PASSWORD_POLICY_MIN_LENGTH} caractères minimum`,
    helperText: `Votre mot de passe doit contenir au moins ${PASSWORD_POLICY_MIN_LENGTH} caractères`,
    validator: password => password.length >= PASSWORD_POLICY_MIN_LENGTH
  },
  {
    message: "1 chiffre minimum",
    helperText: "Votre mot de passe doit contenir au moins 1 chiffre",
    validator: password => password.match(/\d+/g)
  },
  {
    message: "1 caractère spécial minimum",
    helperText: "Votre mot de passe doit contenir au moins 1 caractère spécial",
    validator: password => PASSWORD_POLICY_SPECIAL_CHARACTERS.test(password)
  }
];
export const getPasswordErrors = password => {
  for (const rule of PASSWORD_POLICY_RULES) {
    if (!rule.validator(password)) {
      return rule.helperText;
    }
  }
  return null;
};
