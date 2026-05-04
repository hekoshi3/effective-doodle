import { IsInt, IsNotEmpty } from 'class-validator';

export class FollowUserDto {
  @IsNotEmpty()
  @IsInt()
  following!: number;
}
