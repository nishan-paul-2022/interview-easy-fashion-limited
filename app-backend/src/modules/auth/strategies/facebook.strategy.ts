import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('FACEBOOK_CLIENT_ID') as string,
      clientSecret: configService.get<string>('FACEBOOK_CLIENT_SECRET') as string,
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL') as string,
      profileFields: ['id', 'emails', 'name'],
      scope: ['email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { id, emails, name } = profile;
    return {
      providerId: id,
      email: emails?.[0]?.value,
      fullName: name?.givenName
        ? `${name.givenName} ${name.familyName || ''}`.trim()
        : 'Facebook User',
    };
  }
}
