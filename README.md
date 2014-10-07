TeeVee
======
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/reening/dev-zero?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

An IRC bot.

What does it do?
----------------

It has a few services that are used on the `irc.reening.nl` IRC server.

* `!8ball`: Ask the Magic 8 Ball
* `!g`: Search Google
* `!flirt`: flirt with another user
* `!ud`: Look up something in Urban Dictionary

There's also a handler that sends GitHub Web Hooks to IRC.

How can I run it?
-----------------

* Clone the repo
* Run `npm install`
* Change the config
* `node bot.js`

If it's on a server, you might want to detach using `screen` or `nohup`. Daemonization is planned for later releases.

Why is it named TeeVee?
-----------------------

The bot is named after the Tee Vee character from LEGO Alpha Team, a game @jk-5 and @reening played a lot when they were younger.
