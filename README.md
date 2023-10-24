# n8n-nodes-seatable

![n8n.io - Workflow Automation](https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png)

[n8n](https://www.n8n.io) nodes to trigger workflows from Discord or send interactive messages. Uses the components API which allows to create dialogs (e.g. attach buttons and wait for the user to click on them).

These nodes do not use webhooks but a Discord bot to enable two-way communication. The bot automatically launches into a main process once configured and transmits or receives data from child processes when a node is executed.

## How to install

n8n is shipped with a SeaTable Node. Therefore an installation is usually not required.
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
