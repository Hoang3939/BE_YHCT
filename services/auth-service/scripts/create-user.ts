import { NestFactory } from '@nestjs/core';
import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { SignUpDto } from '../src/auth/dto/signup.dto';

async function promptUser() {
  const rl = createInterface({ input, output });
  try {
    const email = await rl.question('Email: ');
    const password = await rl.question('Password (min 6 chars): ');
    const confirmPassword = await rl.question('Confirm password: ');
    const fullName = await rl.question('Full name: ');

    return { email, password, confirmPassword, fullName };
  } finally {
    rl.close();
  }
}

function formatValidationErrors(errors: Array<{ property: string; constraints?: Record<string, string> }>) {
  return errors
    .map((error) => {
      const messages = error.constraints ? Object.values(error.constraints) : [];
      return messages.length > 0
        ? `${error.property}: ${messages.join(', ')}`
        : `${error.property}: invalid value`;
    })
    .join('\n');
}

async function run() {
  const answers = await promptUser();
  const dto = plainToInstance(SignUpDto, answers);
  const errors = await validate(dto, { whitelist: true });

  if (errors.length > 0) {
    console.error('Validation errors:\n' + formatValidationErrors(errors));
    process.exit(1);
  }

  if (answers.password !== answers.confirmPassword) {
    console.error('Validation errors:\nconfirmPassword: Password confirmation does not match');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const app = await Promise.race([
    NestFactory.createApplicationContext(AppModule, { logger: false }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timed out')), 15000),
    ),
  ]);

  try {
    const authService = app.get(AuthService);
    console.log('Creating user...');

    const result = await Promise.race([
      authService.signUp({
        email: answers.email,
        password: answers.password,
        confirmPassword: answers.confirmPassword,
        fullName: answers.fullName,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Database request timed out')), 15000),
      ),
    ]);

    if (!result?.message) {
      console.error('User creation failed: missing response message.');
      console.error('Result:', result);
      process.exitCode = 1;
      return;
    }

    console.log('User created and saved to database successfully.');
    console.log('Result:', result);
  } catch (error) {
    console.error('Failed to create user:', error?.message ?? error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

run();
