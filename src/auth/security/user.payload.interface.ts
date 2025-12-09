export interface Payload {
  id: number;
  userUuid: string;
  name: string;
  email: string;
  //userType은 명확해진다면 enum으로 수정처리해도 괜찮은 방법임.
  userType: string;
}
