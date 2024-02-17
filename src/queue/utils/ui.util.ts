import { ExpressAdapter } from '@bull-board/express';
import { channelMessageQueue } from '../../queue/queues/channelMessage';
import { guildExtractionQueue } from '../../queue/queues/guildExtraction';
import { guildEventQueue } from '../../queue/queues/guildEvent';
import { userEventQueue } from '../../queue/queues/userEvent';
import { cronJobQueue } from '../../queue/queues/cronJob';
import { directMessageQueue } from '../../queue/queues/directMessage';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { createBullBoard } from '@bull-board/api';


const serverAdapter = new ExpressAdapter();
  createBullBoard({
    queues: [
      new BullMQAdapter(channelMessageQueue),
      new BullMQAdapter(guildExtractionQueue),
      new BullMQAdapter(guildEventQueue),
      new BullMQAdapter(cronJobQueue),
      new BullMQAdapter(directMessageQueue),
      new BullMQAdapter(userEventQueue),
    ],
    serverAdapter,
  });


serverAdapter.setBasePath('/admin/queues');


export default serverAdapter;