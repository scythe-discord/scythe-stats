import Document, {
  DocumentContext,
  Html,
  Head,
  Main,
  NextScript
} from 'next/document';
import { Provider as StyletronProvider } from 'styletron-react';
import { Sheet, Server } from 'styletron-engine-atomic';

import { styletron } from '../styletron';
import { PRIMARY_FONT_FAMILY } from '../lib/theme';

interface Props {
  stylesheets: Sheet[];
}

class MyDocument extends Document<Props> {
  static async getInitialProps(ctx: DocumentContext) {
    const page = ctx.renderPage(App => props => (
      <StyletronProvider value={styletron}>
        <App {...props} />
      </StyletronProvider>
    ));
    const stylesheets = (styletron as Server).getStylesheets() || [];
    return { ...page, stylesheets };
  }

  render() {
    return (
      <Html>
        <Head>
          <link
            href="https://fonts.googleapis.com/css?family=Fira+Sans&display=swap"
            rel="stylesheet"
          />
          {this.props.stylesheets.map((sheet, i) => (
            <style
              className="_styletron_hydrate_"
              dangerouslySetInnerHTML={{ __html: sheet.css }}
              media={sheet.attrs.media}
              data-hydrate={sheet.attrs['data-hydrate']}
              key={i}
            />
          ))}
          <style
            dangerouslySetInnerHTML={{
              __html: `
            html {
              box-sizing: border-box;
            }

            body {
              font-family: ${
                // Make our lives easier such that we don't
                // have to BaseWeb-ify everything (like other libraries)
                PRIMARY_FONT_FAMILY
              };
              background-color: #fcfcfc;
              margin: 0;
            }
            
            *,
            *:before,
            *:after {
              box-sizing: inherit;
              font-family: inherit;
            }
          `
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
