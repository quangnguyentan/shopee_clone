import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
      scope: ['email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    return {
      provider: 'facebook',
      providerId: profile.id,
      email: profile.emails?.[0]?.value,
      name: `${profile.name.givenName} ${profile.name.familyName}`,
      avatar: profile.photos?.[0]?.value,
    };
  }
}
