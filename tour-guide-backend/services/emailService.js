export const sendPasswordResetEmail = async ({ email, resetUrl, token }) => {
  if (process.env.NODE_ENV !== 'production') console.info(`[development email] Password reset for ${email}: ${resetUrl} (token ${token.slice(0, 8)}…)`);
  // Production providers can be connected here without coupling controllers to a vendor.
};
