import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { loginRequest, registerRequest } from '../api';
import type { LoginFormValues, RegisterFormValues } from '../types';

export function useLogin() {
  const { setUser, setTokens } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (values: LoginFormValues) => loginRequest(values),
    onSuccess: ({ user, tokens }) => {
      setUser(user);
      setTokens(tokens.accessToken, tokens.refreshToken);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    },
  });
}

export function useRegister() {
  const { setUser, setTokens } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (values: Omit<RegisterFormValues, 'confirmPassword'>) =>
      registerRequest(values),
    onSuccess: ({ user, tokens }) => {
      setUser(user);
      setTokens(tokens.accessToken, tokens.refreshToken);
      toast.success('Account created! Welcome aboard.');
      navigate('/dashboard');
    },
  });
}
