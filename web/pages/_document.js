import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body style={{backgroundColor: "#ffe7bfff", overflowX: "hidden", overflowY: "hidden"}}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
