import CodeMirror, { type Mode } from 'codemirror';

const IDENTIFIER = /[a-zA-Z0-9#]\w*/;

type ArnaModeState = {
  inAttributes: boolean;
  inString: boolean;
};

function arnaMode(): Mode<ArnaModeState> {
  return {
    startState: () => ({ inAttributes: false, inString: false }),
    token: (stream, state) => {
      if (stream.match(/GRAPH/i, true)) {
        return 'def';
      }

      if (stream.match(/{/)) {
        return 'bracket';
      }

      if (stream.match(/}/)) {
        return 'bracket';
      }

      if (!state.inAttributes && stream.match(IDENTIFIER, true)) {
        return 'variable';
      }

      if (state.inAttributes) {
        if (stream.match(/,/)) {
          return null;
        }
        if (stream.match(/".*?"/)) {
          return 'property';
        }
        if (stream.match(/[0-9]/)) {
          return 'def';
        }
        if (stream.match(/=/, true)) {
          return 'atom';
        }
        if (stream.match(/BUNDLE/i)) {
          return 'keyword';
        }
        if (stream.match(/COLOR/i)) {
          return 'keyword';
        }
        if (stream.match(/LABEL/i)) {
          return 'keyword';
        }
        if (stream.match(/LINE-WIDTH/i)) {
          return 'keyword';
        }
      }

      if (stream.match(/\[/)) {
        // eslint-disable-next-line no-param-reassign
        state.inAttributes = true;
        return null;
      }
      if (stream.match(/\]/)) {
        // eslint-disable-next-line no-param-reassign
        state.inAttributes = false;
        return null;
      }

      stream.next();
      return null;
    },
  };
}

export default function createArnaMode() {
  if ('arna' in CodeMirror.modes) return;

  CodeMirror.defineMode('arna', arnaMode);
}
