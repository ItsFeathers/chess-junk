<script>
import tmi from 'tmi.js';

export default {
  name: 'TwitchReader',
  components: {
  },
  created: function () {
    this.client = new tmi.Client({
        options: { debug: true },
        connection: {
            reconnect: true,
            secure: true
        },
        identity: {
            username: 'brainbot',
            password: ''
        },
        channels: [ '' ]
    });
    this.client.connect().catch(console.error);
    this.client.on('message', this.messageReceived)
  },
  methods: {
    messageReceived(channel, tags, message, self) {
      this.$emit('messageRecieved', tags['display-name'], message)
    },
  },
  data() {
    return {
      client: null,
      channel: 'itisfeathers',
    };
  },
};
</script>