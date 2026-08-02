export interface IContactService {
  sendMessage(email: string, message: string): Promise<boolean>;
}

export class MockContactService implements IContactService {
  public async sendMessage(email: string, message: string): Promise<boolean> {
    if (!email || !message) {
      return false;
    }
    // Simulated network delay
    await new Promise((resolve) => setTimeout(resolve, 50));
    return true;
  }
}
