# n8n-nodes-seatable

![n8n.io - Workflow Automation](https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png)

This SeaTable node allows you to automate work in Seatable, and integrate SeaTable with other applications. n8n has built-in support for a wide range of SeaTable features, including creating, reading, listing, updating and deleting entries in a SeaTable base.

## How to install

n8n is shipped with a SeaTable node. Therefore an installation is usually not required.
You can install this community node, if you want to test newest features, that might not be available with the version shipped with n8n.

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes**.
2. Select **Install**.
3. Enter `n8n-nodes-seatable` in **Enter npm package name**.
4. Agree to the [risks](https://docs.n8n.io/integrations/community-nodes/risks/) of using community nodes: select **I understand the risks of installing unverified code from a public source**.
5. Select **Install**.

After installing the node, you can use it like any other node. n8n displays the node in search results in the **Nodes** panel.

## License

[MIT](https://github.com/n8n-io/n8n-nodes-starter/blob/master/LICENSE.md)

## Local development

Read more at https://docs.n8n.io/integrations/creating-nodes/build/declarative-style-node/#test-your-node.

Here is the summary:

1. Install n8n globally on your PC with `npm install n8n -g`
2. Clone or download this repository and save it anywhere
3. In this downloaded folder run:

```
npm install
npm run build
npm link
```

4. Now install this node in your local n8n instance

```
cd ~/.n8n/nodes
npm link seatable-n8n-nodes-seatable
```

5. Start the local development area. You need two consoles:

```
# in the node directory execute this, that after every change the dist directory is updated
npm run dev
n8n start
```
