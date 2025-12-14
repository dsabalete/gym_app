import { RDSDataClient, ExecuteStatementCommand, BeginTransactionCommand, CommitTransactionCommand, RollbackTransactionCommand } from '@aws-sdk/client-rds-data'

export interface DatabaseConfig {
  region: string
  accessKeyId?: string
  secretAccessKey?: string
  clusterArn: string
  secretArn: string
  database: string
}

export class AwsRdsClient {
  private client: RDSDataClient
  private config: DatabaseConfig

  constructor(config: DatabaseConfig) {
    this.config = config

    const credentials = config.accessKeyId && config.secretAccessKey
      ? { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey }
      : undefined

    this.client = new RDSDataClient({
      region: config.region,
      credentials
    })
  }

  async execute(sql: string, parameters: Record<string, any> | any[] = [], transactionId?: string): Promise<any> {
    try {
      let formattedParams: any[] | undefined
      if (Array.isArray(parameters)) {
        formattedParams = parameters.map((value, index) => ({
          name: `param${index}`,
          value: this.formatParameter(value)
        }))
      } else if (parameters && typeof parameters === 'object') {
        formattedParams = Object.entries(parameters).map(([name, value]) => ({
          name,
          value: this.formatParameter(value)
        }))
      }

      const command = new ExecuteStatementCommand({
        resourceArn: this.config.clusterArn,
        secretArn: this.config.secretArn,
        database: this.config.database,
        sql,
        parameters: formattedParams,
        includeResultMetadata: true,
        transactionId
      })

      const response = await this.client.send(command)
      return this.formatResponse(response)
    } catch (error) {
      console.error('Database execution error:', error)
      throw error
    }
  }

  async beginTransaction(): Promise<string> {
    const cmd = new BeginTransactionCommand({
      resourceArn: this.config.clusterArn,
      secretArn: this.config.secretArn,
      database: this.config.database
    })
    const res = await this.client.send(cmd)
    return res.transactionId as string
  }

  async commitTransaction(transactionId: string): Promise<void> {
    const cmd = new CommitTransactionCommand({
      resourceArn: this.config.clusterArn,
      secretArn: this.config.secretArn,
      transactionId
    })
    await this.client.send(cmd)
  }

  async rollbackTransaction(transactionId: string): Promise<void> {
    const cmd = new RollbackTransactionCommand({
      resourceArn: this.config.clusterArn,
      secretArn: this.config.secretArn,
      transactionId
    })
    await this.client.send(cmd)
  }

  private formatParameter(value: any): any {
    if (value === null || value === undefined) {
      return { isNull: true }
    }

    if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        return { longValue: value }
      }
      return { doubleValue: value }
    }

    if (typeof value === 'boolean') {
      return { booleanValue: value }
    }

    return { stringValue: String(value) }
  }

  private formatResponse(response: any): any {
    if (!response.records) {
      return { records: [], numberOfRecordsUpdated: response.numberOfRecordsUpdated || 0 }
    }

    const records = response.records.map((record: any[]) => {
      const row: any = {}
      response.columnMetadata?.forEach((meta: any, index: number) => {
        const value = record[index]
        const key = (meta.label && String(meta.label).trim().length > 0) ? meta.label : meta.name
        row[key] = this.extractValue(value)
      })
      return row
    })

    return {
      records,
      numberOfRecordsUpdated: response.numberOfRecordsUpdated || 0,
      columnMetadata: response.columnMetadata
    }
  }

  private extractValue(field: any): any {
    if (field.isNull) return null
    if (field.stringValue !== undefined) return field.stringValue
    if (field.doubleValue !== undefined) return field.doubleValue
    if (field.booleanValue !== undefined) return field.booleanValue
    if (field.longValue !== undefined) return field.longValue
    return null
  }
}

export function createRdsClient(): AwsRdsClient {
  const config = useRuntimeConfig()

  return new AwsRdsClient({
    region: config.aws.region,
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
    clusterArn: config.aws.rds.clusterArn,
    secretArn: config.aws.rds.secretArn,
    database: config.aws.rds.database
  })
}
