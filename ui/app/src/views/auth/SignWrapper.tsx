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

/* TODO: @Gladorme check social button types */
/* eslint @typescript-eslint/explicit-function-return-type: 0 */
/* typescript-eslint/explicit-module-boundary-types: 0 */

import { Separator, useIcon } from '@perses-dev/components';
import './SignWrapper.css';
import { ReactElement, ReactNode, useCallback, useMemo } from 'react';
import {
  AmazonLoginButton,
  AppleLoginButton,
  BufferLoginButton,
  createButton,
  createSvgIcon,
  DiscordLoginButton,
  FacebookLoginButton,
  GithubLoginButton,
  GoogleLoginButton,
  InstagramLoginButton,
  LinkedInLoginButton,
  MetamaskLoginButton,
  MicrosoftLoginButton,
  OktaLoginButton,
  SlackLoginButton,
  TelegramLoginButton,
  TikTokLoginButton,
  TwitterLoginButton,
  YahooLoginButton,
  ZaloLoginButton,
} from 'react-social-login-buttons';
import { useDarkMode } from '../../context/DarkMode';
import PersesLogoCropped from '../../components/logo/PersesLogoCropped';
import DarkThemePersesLogo from '../../components/logo/DarkThemePersesLogo';
import LightThemePersesLogo from '../../components/logo/LightThemePersesLogo';
import { useIsLaptopSize } from '../../utils/browser-size';
import { useConfigContext } from '../../context/Config';
import { buildRedirectQueryString, useRedirectQueryParam } from '../../model/auth-client';

export function SignWrapper(props: { children: ReactNode }): ReactElement {
  const GitlabIcon = useIcon('Gitlab');
  const CodeIcon = useIcon('Code');
  const { isDarkModeEnabled } = useDarkMode();
  const isLaptopSize = useIsLaptopSize();
  const config = useConfigContext();
  const socialButtonsMapping = useMemo(
    () => ({
      amazon: () => AmazonLoginButton,
      apple: () => AppleLoginButton,
      buffer: () => BufferLoginButton,
      discord: () => DiscordLoginButton,
      facebook: () => FacebookLoginButton,
      github: () => GithubLoginButton,
      google: () => GoogleLoginButton,
      instagram: () => InstagramLoginButton,
      linkedin: () => LinkedInLoginButton,
      metamask: () => MetamaskLoginButton,
      microsoft: () => MicrosoftLoginButton,
      okta: () => OktaLoginButton,
      slack: () => SlackLoginButton,
      telegram: () => TelegramLoginButton,
      tiktok: () => TikTokLoginButton,
      twitter: () => TwitterLoginButton,
      yahoo: () => YahooLoginButton,
      zalo: () => ZaloLoginButton,
      gitlab: () =>
        createButton({
          icon: createSvgIcon(GitlabIcon),
          iconFormat: (name) => `fa fa-${name}`,
          style: { background: '#fc6d26' },
          activeStyle: { background: '#d55a1c' },
        }),
      bitbucket: () =>
        createButton({
          icon: createSvgIcon(CodeIcon),
          iconFormat: (name) => `fa fa-${name}`,
          style: { background: '#0C66E4' },
          activeStyle: { background: '#0055CC' },
        }),
      '': () =>
        createButton({
          icon: '',
          style: {
            color: 'var(--ps-text-primary)',
            backgroundColor: 'var(--ps-background-default)',
          },
          activeStyle: {
            backgroundColor: 'var(--ps-color-primary-hover)',
          },
        }),
    }),
    [CodeIcon, GitlabIcon]
  );

  const computeSocialButtonFromURL = useCallback(
    (url: string) => {
      for (const [key, createButtonFromMap] of Object.entries(socialButtonsMapping)) {
        if (url.includes(key)) {
          return createButtonFromMap();
        }
      }

      return socialButtonsMapping['']();
    },
    [socialButtonsMapping]
  );
  const oauthProviders = (config.config?.security?.authentication?.providers?.oauth || []).map((provider) => ({
    path: `oauth/${provider.slug_id}`,
    name: provider.name,
    button: computeSocialButtonFromURL(provider.auth_url),
  }));
  const oidcProviders = (config.config?.security?.authentication?.providers?.oidc || []).map((provider) => ({
    path: `oidc/${provider.slug_id}`,
    name: provider.name,
    button: computeSocialButtonFromURL(provider.issuer),
  }));
  const socialProviders = [...oidcProviders, ...oauthProviders];
  const nativeProviderIsEnabled = config.config?.security?.authentication?.providers?.enable_native;
  const path = useRedirectQueryParam();

  return (
    <div className={`ps-SignWrapper ${isLaptopSize ? 'ps-SignWrapper--laptop' : ''}`}>
      {!isLaptopSize ? <PersesLogoCropped /> : isDarkModeEnabled ? <DarkThemePersesLogo /> : <LightThemePersesLogo />}
      <Separator
        orientation={isLaptopSize ? 'vertical' : 'horizontal'}
        className={`ps-SignWrapper-divider ${isLaptopSize ? 'ps-SignWrapper-divider--vertical' : ''}`}
      />
      <div className="ps-SignWrapper-content">
        {nativeProviderIsEnabled && props.children}
        {nativeProviderIsEnabled && socialProviders.length > 0 && (
          <div className="ps-SignWrapper-orDivider">
            <Separator className="ps-SignWrapper-orLine" />
            <span className="ps-SignWrapper-orText">or</span>
            <Separator className="ps-SignWrapper-orLine" />
          </div>
        )}
        {socialProviders.map((provider) => {
          const SocialButton = provider.button;
          return (
            <SocialButton
              iconSize="20px"
              size="32px"
              key={provider.path}
              fullWidth={true}
              style={{ fontSize: '1em' }}
              onClick={() => {
                window.location.href = `/api/auth/providers/${provider.path}/login?${buildRedirectQueryString(path)}`;
              }}
            >
              Sign in with {provider.name}
            </SocialButton>
          );
        })}
      </div>
    </div>
  );
}
