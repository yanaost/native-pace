import {
  AUDIO_CACHE_NAME,
  AUDIO_CACHE_MAX_ENTRIES,
  AUDIO_CACHE_MAX_AGE_SECONDS,
  getAudioCacheConfig,
  getPWAConfig,
} from '../pwa-helpers';

describe('AUDIO_CACHE_NAME', () => {
  it('should equal audio-cache', () => {
    expect(AUDIO_CACHE_NAME).toBe('audio-cache');
  });
});

describe('AUDIO_CACHE_MAX_ENTRIES', () => {
  it('should equal 200', () => {
    expect(AUDIO_CACHE_MAX_ENTRIES).toBe(200);
  });
});

describe('AUDIO_CACHE_MAX_AGE_SECONDS', () => {
  it('should equal 30 days in seconds', () => {
    const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
    expect(AUDIO_CACHE_MAX_AGE_SECONDS).toBe(thirtyDaysInSeconds);
  });

  it('should equal 2592000 seconds', () => {
    expect(AUDIO_CACHE_MAX_AGE_SECONDS).toBe(2592000);
  });
});

describe('getAudioCacheConfig', () => {
  it('should return correct structure', () => {
    const config = getAudioCacheConfig();
    expect(config).toHaveProperty('urlPattern');
    expect(config).toHaveProperty('handler');
    expect(config).toHaveProperty('options');
    expect(config.options).toHaveProperty('cacheName');
    expect(config.options).toHaveProperty('expiration');
  });

  it('should use CacheFirst handler', () => {
    const config = getAudioCacheConfig();
    expect(config.handler).toBe('CacheFirst');
  });

  it('should use correct cache name', () => {
    const config = getAudioCacheConfig();
    expect(config.options.cacheName).toBe(AUDIO_CACHE_NAME);
  });

  it('should set correct max entries', () => {
    const config = getAudioCacheConfig();
    expect(config.options.expiration.maxEntries).toBe(AUDIO_CACHE_MAX_ENTRIES);
  });

  it('should set correct max age', () => {
    const config = getAudioCacheConfig();
    expect(config.options.expiration.maxAgeSeconds).toBe(AUDIO_CACHE_MAX_AGE_SECONDS);
  });

  describe('urlPattern', () => {
    it('should match https mp3 files', () => {
      const config = getAudioCacheConfig();
      expect(config.urlPattern.test('https://example.com/audio.mp3')).toBe(true);
      expect(config.urlPattern.test('https://cdn.example.com/path/to/file.mp3')).toBe(true);
    });

    it('should not match http mp3 files', () => {
      const config = getAudioCacheConfig();
      expect(config.urlPattern.test('http://example.com/audio.mp3')).toBe(false);
    });

    it('should not match non-mp3 files', () => {
      const config = getAudioCacheConfig();
      expect(config.urlPattern.test('https://example.com/audio.wav')).toBe(false);
      expect(config.urlPattern.test('https://example.com/audio.ogg')).toBe(false);
      expect(config.urlPattern.test('https://example.com/image.png')).toBe(false);
    });

    it('should not match mp3 in path but not extension', () => {
      const config = getAudioCacheConfig();
      expect(config.urlPattern.test('https://example.com/mp3/audio.wav')).toBe(false);
    });
  });
});

describe('getPWAConfig', () => {
  it('should return correct structure', () => {
    const config = getPWAConfig(false);
    expect(config).toHaveProperty('dest');
    expect(config).toHaveProperty('disable');
    expect(config).toHaveProperty('runtimeCaching');
  });

  it('should set dest to public', () => {
    const config = getPWAConfig(false);
    expect(config.dest).toBe('public');
  });

  it('should disable PWA in development', () => {
    const config = getPWAConfig(true);
    expect(config.disable).toBe(true);
  });

  it('should enable PWA in production', () => {
    const config = getPWAConfig(false);
    expect(config.disable).toBe(false);
  });

  it('should include audio caching in runtimeCaching', () => {
    const config = getPWAConfig(false);
    expect(config.runtimeCaching).toHaveLength(1);
    expect(config.runtimeCaching[0].options.cacheName).toBe(AUDIO_CACHE_NAME);
  });

  it('should have same audio config regardless of isDev', () => {
    const devConfig = getPWAConfig(true);
    const prodConfig = getPWAConfig(false);
    expect(devConfig.runtimeCaching).toEqual(prodConfig.runtimeCaching);
  });
});
