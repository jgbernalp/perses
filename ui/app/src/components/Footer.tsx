import { useSnackbar, Progress, useIcon } from '@perses-dev/components';
import { ReactElement } from 'react';
import { useHealth } from '../model/health-client';
import './Footer.css';

export default function Footer(): ReactElement {
  const GithubIcon = useIcon('Github');
  const { exceptionSnackbar } = useSnackbar();
  const { data, isLoading, error } = useHealth();

  if (error) {
    exceptionSnackbar(error);
  }

  return (
    <footer className="ps-Footer">
      <ul className="ps-Footer-list">
        <li>&copy; The Perses Authors {new Date().getFullYear()}</li>
        <li>
          <a href="https://github.com/perses/perses" target="_blank" rel="noreferrer">
            <GithubIcon className="ps-Footer-github-icon" />
          </a>
        </li>
        <li>
          {isLoading ? (
            <Progress size="sm" />
          ) : data !== undefined && data.version !== '' ? (
            <a
              className="ps-Footer-link"
              target="_blank"
              rel="noreferrer"
              href={
                data.version.startsWith('main')
                  ? `https://github.com/perses/perses/tree/${data.commit}`
                  : `https://github.com/perses/perses/releases/tag/v${data.version}`
              }
            >
              {data.version}
            </a>
          ) : (
            'development version'
          )}
        </li>
      </ul>
    </footer>
  );
}
