/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

//import AWS from 'aws-sdk'
import {
  EC2Client,
  StartInstancesCommand,
  StopInstancesCommand,
} from '@aws-sdk/client-ec2'
import { SSMClient, SendCommandCommand } from '@aws-sdk/client-ssm'
import { env } from '~/env'
const REGION = 'us-east-2' // e.g. "us-east-1"
const INSTANCE_ID = 'i-055464ed9b76e9e3a'

const client = new EC2Client({
  region: REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
})

const ssmClient = new SSMClient({
  region: REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
})

export const turnOnMachine = async (instanceId: string) => {
  const command = new StartInstancesCommand({
    InstanceIds: [instanceId],
  })

  try {
    const { StartingInstances } = await client.send(command)
    const instanceIdList = StartingInstances?.map(
      (instance) => ` • ${instance.InstanceId}`,
    )
    console.log('Starting instances:')
    console.log(instanceIdList?.join('\n'))
  } catch (err) {
    console.error(err)
  }
}

export const runDataPull = async (instanceId = INSTANCE_ID) => {
  const cmd = `bash /home/ec2-user/epi-ad-tracker-v2/SCRIPTS/runscript.sh`

  const params = {
    InstanceIds: [instanceId],
    DocumentName: 'AWS-RunShellScript',
    Parameters: {
      commands: [
        // "echo 'Running data pull script'  > /home/ec2-user/epi-ad-tracker-v2/log1.txt 2>&1",
        cmd,
      ],
    },
  }

  const command = new SendCommandCommand(params)

  try {
    const data = await ssmClient.send(command)
    console.log('Command sent successfully', data)
  } catch (error) {
    console.error('Error in sending command', error)
  }
}

export const turnOffMachine = async (instanceId = INSTANCE_ID) => {
  const command = new StopInstancesCommand({
    InstanceIds: [instanceId],
    Force: true,
  })

  try {
    const { StoppingInstances } = await client.send(command)
    const instanceIdList = StoppingInstances?.map(
      (instance) => ` • ${instance.InstanceId}`,
    )
    console.log('Stopping instances:')
    console.log(instanceIdList?.join('\n'))
  } catch (err) {
    console.error(err)
  }
}
