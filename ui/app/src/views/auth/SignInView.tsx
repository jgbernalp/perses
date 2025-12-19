// Copyright 2023 The Perses Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Button, TextField, Progress, useSnackbar } from '@perses-dev/components';
import { ReactElement, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useNativeAuthMutation, useRedirectQueryParam } from '../../model/auth-client';
import { SignUpRoute } from '../../model/route';
import { useIsSignUpDisable } from '../../context/Config';
import { SignWrapper } from './SignWrapper';
import './SignInView.css';

function SignInView(): ReactElement {
  const isSignUpDisable = useIsSignUpDisable();
  const authMutation = useNativeAuthMutation();
  const navigate = useNavigate();
  const { successSnackbar, exceptionSnackbar } = useSnackbar();
  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const redirectPath = useRedirectQueryParam();

  const handleLogin = (): void => {
    authMutation.mutate(
      { login: login, password: password },
      {
        onSuccess: () => {
          successSnackbar(`Successfully login`);
          navigate(redirectPath);
        },
        onError: (err) => {
          exceptionSnackbar(err);
        },
      }
    );
  };

  const isSignInDisabled = (): boolean => {
    return authMutation.isPending || login === '' || password === '';
  };

  const handleKeypress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (isSignInDisabled()) {
      return;
    }

    // Sign in on pressing Enter button
    if (e.charCode === 13) {
      handleLogin();
    }
  };

  return (
    <SignWrapper>
      <TextField label="Username" required onChange={(value) => setLogin(value)} onKeyPress={handleKeypress} />
      <TextField
        type="password"
        label="Password"
        required
        onChange={(value) => setPassword(value)}
        onKeyPress={handleKeypress}
      />
      <Button variant="solid" disabled={isSignInDisabled()} onClick={() => handleLogin()}>
        Sign in
      </Button>
      {authMutation.isPending && <Progress />}
      {!isSignUpDisable && (
        <p className="ps-SignInView-registerLink">
          Don&lsquo;t have an account yet?&nbsp;
          <RouterLink to={SignUpRoute} className="ps-SignInView-link">
            Register now
          </RouterLink>
        </p>
      )}
    </SignWrapper>
  );
}

export default SignInView;
