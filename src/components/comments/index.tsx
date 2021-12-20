import { ReactElement } from 'react';

export default function Comments(): ReactElement {
  return (
    <section
      style={{ width: '100%' }}
      ref={element => {
        if (!element) {
          return;
        }

        const scriptElement = document.createElement('script');
        scriptElement.setAttribute('src', 'https://utteranc.es/client.js');
        scriptElement.setAttribute(
          'repo',
          'joaogabrielramos28/desafio-chapter-3-react-ignite'
        );
        scriptElement.setAttribute('issue-term', 'pathname');
        scriptElement.setAttribute('theme', 'photon-dark');
        scriptElement.setAttribute('crossorigin', 'anonymous');
        scriptElement.setAttribute('async', 'true');
        element.replaceChildren(scriptElement);
      }}
    />
  );
}
