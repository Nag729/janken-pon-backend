import { User } from "./User";

export class Room {
  private readonly _roomId: string;
  private readonly _userList: User[];

  constructor(roomId: string, firstUser: User) {
    this._roomId = roomId;
    this._userList = [firstUser];
  }

  addUser(user: User): void {
    this._userList.push(user);
  }

  public roomId(): string {
    return this._roomId;
  }

  public userNameList(): string[] {
    return this._userList.map((user) => user.userName());
  }
}
