import {
  CORE_WEB_VITALS,
  DEFAULT_IMAGE_QUALITY,
  IMAGE_FORMATS,
  DEVICE_SIZES,
  IMAGE_SIZES,
  PRELOAD_BATCH_SIZE,
  AUDIO_PRELOAD_DELAY_MS,
  isGoodLCP,
  isGoodFID,
  isGoodCLS,
  getWebVitalRating,
  getAllWebVitalRatings,
  passesWebVitals,
  getImageOptimizationConfig,
  createPreloadQueue,
  shouldPreloadAudio,
  getOptimalBatchSize,
  getPreloadDelay,
} from '../performance-helpers';

describe('Core Web Vitals Constants', () => {
  describe('LCP thresholds', () => {
    it('should have good threshold at 2500ms', () => {
      expect(CORE_WEB_VITALS.LCP.good).toBe(2500);
    });

    it('should have needs improvement threshold at 4000ms', () => {
      expect(CORE_WEB_VITALS.LCP.needsImprovement).toBe(4000);
    });

    it('should have correct name and unit', () => {
      expect(CORE_WEB_VITALS.LCP.name).toBe('Largest Contentful Paint');
      expect(CORE_WEB_VITALS.LCP.unit).toBe('ms');
    });
  });

  describe('FID thresholds', () => {
    it('should have good threshold at 100ms', () => {
      expect(CORE_WEB_VITALS.FID.good).toBe(100);
    });

    it('should have needs improvement threshold at 300ms', () => {
      expect(CORE_WEB_VITALS.FID.needsImprovement).toBe(300);
    });

    it('should have correct name and unit', () => {
      expect(CORE_WEB_VITALS.FID.name).toBe('First Input Delay');
      expect(CORE_WEB_VITALS.FID.unit).toBe('ms');
    });
  });

  describe('CLS thresholds', () => {
    it('should have good threshold at 0.1', () => {
      expect(CORE_WEB_VITALS.CLS.good).toBe(0.1);
    });

    it('should have needs improvement threshold at 0.25', () => {
      expect(CORE_WEB_VITALS.CLS.needsImprovement).toBe(0.25);
    });

    it('should have correct name and empty unit', () => {
      expect(CORE_WEB_VITALS.CLS.name).toBe('Cumulative Layout Shift');
      expect(CORE_WEB_VITALS.CLS.unit).toBe('');
    });
  });
});

describe('Image Optimization Constants', () => {
  it('should have DEFAULT_IMAGE_QUALITY at 75', () => {
    expect(DEFAULT_IMAGE_QUALITY).toBe(75);
  });

  it('should have avif and webp formats', () => {
    expect(IMAGE_FORMATS).toContain('image/avif');
    expect(IMAGE_FORMATS).toContain('image/webp');
  });

  it('should have 8 device sizes', () => {
    expect(DEVICE_SIZES).toHaveLength(8);
  });

  it('should have device sizes in ascending order', () => {
    for (let i = 1; i < DEVICE_SIZES.length; i++) {
      expect(DEVICE_SIZES[i]).toBeGreaterThan(DEVICE_SIZES[i - 1]);
    }
  });

  it('should have 8 image sizes', () => {
    expect(IMAGE_SIZES).toHaveLength(8);
  });

  it('should have image sizes in ascending order', () => {
    for (let i = 1; i < IMAGE_SIZES.length; i++) {
      expect(IMAGE_SIZES[i]).toBeGreaterThan(IMAGE_SIZES[i - 1]);
    }
  });
});

describe('Audio Preload Constants', () => {
  it('should have PRELOAD_BATCH_SIZE at 5', () => {
    expect(PRELOAD_BATCH_SIZE).toBe(5);
  });

  it('should have AUDIO_PRELOAD_DELAY_MS at 100', () => {
    expect(AUDIO_PRELOAD_DELAY_MS).toBe(100);
  });
});

describe('isGoodLCP', () => {
  it('should return true for values under 2500', () => {
    expect(isGoodLCP(2000)).toBe(true);
    expect(isGoodLCP(2499)).toBe(true);
    expect(isGoodLCP(0)).toBe(true);
  });

  it('should return false for values at or above 2500', () => {
    expect(isGoodLCP(2500)).toBe(false);
    expect(isGoodLCP(3000)).toBe(false);
    expect(isGoodLCP(5000)).toBe(false);
  });
});

describe('isGoodFID', () => {
  it('should return true for values under 100', () => {
    expect(isGoodFID(50)).toBe(true);
    expect(isGoodFID(99)).toBe(true);
    expect(isGoodFID(0)).toBe(true);
  });

  it('should return false for values at or above 100', () => {
    expect(isGoodFID(100)).toBe(false);
    expect(isGoodFID(200)).toBe(false);
    expect(isGoodFID(500)).toBe(false);
  });
});

describe('isGoodCLS', () => {
  it('should return true for values under 0.1', () => {
    expect(isGoodCLS(0.05)).toBe(true);
    expect(isGoodCLS(0.09)).toBe(true);
    expect(isGoodCLS(0)).toBe(true);
  });

  it('should return false for values at or above 0.1', () => {
    expect(isGoodCLS(0.1)).toBe(false);
    expect(isGoodCLS(0.15)).toBe(false);
    expect(isGoodCLS(0.5)).toBe(false);
  });
});

describe('getWebVitalRating', () => {
  describe('LCP', () => {
    it('should return good for values under 2500', () => {
      expect(getWebVitalRating('LCP', 2000)).toBe('good');
    });

    it('should return needs-improvement for values 2500-3999', () => {
      expect(getWebVitalRating('LCP', 2500)).toBe('needs-improvement');
      expect(getWebVitalRating('LCP', 3500)).toBe('needs-improvement');
    });

    it('should return poor for values >= 4000', () => {
      expect(getWebVitalRating('LCP', 4000)).toBe('poor');
      expect(getWebVitalRating('LCP', 5000)).toBe('poor');
    });
  });

  describe('FID', () => {
    it('should return good for values under 100', () => {
      expect(getWebVitalRating('FID', 50)).toBe('good');
    });

    it('should return needs-improvement for values 100-299', () => {
      expect(getWebVitalRating('FID', 100)).toBe('needs-improvement');
      expect(getWebVitalRating('FID', 200)).toBe('needs-improvement');
    });

    it('should return poor for values >= 300', () => {
      expect(getWebVitalRating('FID', 300)).toBe('poor');
      expect(getWebVitalRating('FID', 500)).toBe('poor');
    });
  });

  describe('CLS', () => {
    it('should return good for values under 0.1', () => {
      expect(getWebVitalRating('CLS', 0.05)).toBe('good');
    });

    it('should return needs-improvement for values 0.1-0.24', () => {
      expect(getWebVitalRating('CLS', 0.1)).toBe('needs-improvement');
      expect(getWebVitalRating('CLS', 0.2)).toBe('needs-improvement');
    });

    it('should return poor for values >= 0.25', () => {
      expect(getWebVitalRating('CLS', 0.25)).toBe('poor');
      expect(getWebVitalRating('CLS', 0.5)).toBe('poor');
    });
  });
});

describe('getAllWebVitalRatings', () => {
  it('should return all good for passing metrics', () => {
    const ratings = getAllWebVitalRatings({
      lcp: 2000,
      fid: 50,
      cls: 0.05,
    });
    expect(ratings.lcp).toBe('good');
    expect(ratings.fid).toBe('good');
    expect(ratings.cls).toBe('good');
  });

  it('should return mixed ratings for mixed metrics', () => {
    const ratings = getAllWebVitalRatings({
      lcp: 3000,
      fid: 50,
      cls: 0.3,
    });
    expect(ratings.lcp).toBe('needs-improvement');
    expect(ratings.fid).toBe('good');
    expect(ratings.cls).toBe('poor');
  });
});

describe('passesWebVitals', () => {
  it('should return true when all metrics are good', () => {
    expect(
      passesWebVitals({
        lcp: 2000,
        fid: 50,
        cls: 0.05,
      })
    ).toBe(true);
  });

  it('should return false when LCP fails', () => {
    expect(
      passesWebVitals({
        lcp: 3000,
        fid: 50,
        cls: 0.05,
      })
    ).toBe(false);
  });

  it('should return false when FID fails', () => {
    expect(
      passesWebVitals({
        lcp: 2000,
        fid: 150,
        cls: 0.05,
      })
    ).toBe(false);
  });

  it('should return false when CLS fails', () => {
    expect(
      passesWebVitals({
        lcp: 2000,
        fid: 50,
        cls: 0.15,
      })
    ).toBe(false);
  });
});

describe('getImageOptimizationConfig', () => {
  it('should return correct quality', () => {
    const config = getImageOptimizationConfig();
    expect(config.quality).toBe(75);
  });

  it('should include avif and webp formats', () => {
    const config = getImageOptimizationConfig();
    expect(config.formats).toContain('image/avif');
    expect(config.formats).toContain('image/webp');
  });

  it('should include device sizes', () => {
    const config = getImageOptimizationConfig();
    expect(config.deviceSizes).toHaveLength(8);
    expect(config.deviceSizes).toContain(1920);
  });

  it('should include image sizes', () => {
    const config = getImageOptimizationConfig();
    expect(config.imageSizes).toHaveLength(8);
    expect(config.imageSizes).toContain(256);
  });
});

describe('createPreloadQueue', () => {
  it('should return empty array for empty input', () => {
    expect(createPreloadQueue([])).toEqual([]);
  });

  it('should create single batch for fewer than batchSize URLs', () => {
    const urls = ['url1.mp3', 'url2.mp3', 'url3.mp3'];
    const batches = createPreloadQueue(urls);
    expect(batches).toHaveLength(1);
    expect(batches[0]).toEqual(urls);
  });

  it('should create multiple batches for many URLs', () => {
    const urls = Array.from({ length: 12 }, (_, i) => `url${i}.mp3`);
    const batches = createPreloadQueue(urls);
    expect(batches).toHaveLength(3);
    expect(batches[0]).toHaveLength(5);
    expect(batches[1]).toHaveLength(5);
    expect(batches[2]).toHaveLength(2);
  });

  it('should use custom batch size', () => {
    const urls = Array.from({ length: 9 }, (_, i) => `url${i}.mp3`);
    const batches = createPreloadQueue(urls, { batchSize: 3, delayMs: 100 });
    expect(batches).toHaveLength(3);
    expect(batches[0]).toHaveLength(3);
    expect(batches[1]).toHaveLength(3);
    expect(batches[2]).toHaveLength(3);
  });

  it('should handle exact batch size multiple', () => {
    const urls = Array.from({ length: 10 }, (_, i) => `url${i}.mp3`);
    const batches = createPreloadQueue(urls);
    expect(batches).toHaveLength(2);
    expect(batches[0]).toHaveLength(5);
    expect(batches[1]).toHaveLength(5);
  });
});

describe('shouldPreloadAudio', () => {
  it('should return true when no network info is available', () => {
    expect(shouldPreloadAudio()).toBe(true);
    expect(shouldPreloadAudio(undefined)).toBe(true);
  });

  it('should return true for 4g connection', () => {
    expect(shouldPreloadAudio({ effectiveType: '4g' })).toBe(true);
  });

  it('should return true for 3g connection', () => {
    expect(shouldPreloadAudio({ effectiveType: '3g' })).toBe(true);
  });

  it('should return false for 2g connection', () => {
    expect(shouldPreloadAudio({ effectiveType: '2g' })).toBe(false);
  });

  it('should return false for slow-2g connection', () => {
    expect(shouldPreloadAudio({ effectiveType: 'slow-2g' })).toBe(false);
  });

  it('should return false when saveData is enabled', () => {
    expect(shouldPreloadAudio({ saveData: true })).toBe(false);
    expect(shouldPreloadAudio({ effectiveType: '4g', saveData: true })).toBe(false);
  });
});

describe('getOptimalBatchSize', () => {
  it('should return default batch size when no network info', () => {
    expect(getOptimalBatchSize()).toBe(PRELOAD_BATCH_SIZE);
    expect(getOptimalBatchSize(undefined)).toBe(PRELOAD_BATCH_SIZE);
  });

  it('should return default for 4g', () => {
    expect(getOptimalBatchSize({ effectiveType: '4g' })).toBe(PRELOAD_BATCH_SIZE);
  });

  it('should return 3 for 3g', () => {
    expect(getOptimalBatchSize({ effectiveType: '3g' })).toBe(3);
  });

  it('should return 1 for 2g', () => {
    expect(getOptimalBatchSize({ effectiveType: '2g' })).toBe(1);
  });

  it('should return 1 for slow-2g', () => {
    expect(getOptimalBatchSize({ effectiveType: 'slow-2g' })).toBe(1);
  });
});

describe('getPreloadDelay', () => {
  it('should return default delay when no network info', () => {
    expect(getPreloadDelay()).toBe(AUDIO_PRELOAD_DELAY_MS);
    expect(getPreloadDelay(undefined)).toBe(AUDIO_PRELOAD_DELAY_MS);
  });

  it('should return default for 4g', () => {
    expect(getPreloadDelay({ effectiveType: '4g' })).toBe(AUDIO_PRELOAD_DELAY_MS);
  });

  it('should return 200 for 3g', () => {
    expect(getPreloadDelay({ effectiveType: '3g' })).toBe(200);
  });

  it('should return 300 for 2g', () => {
    expect(getPreloadDelay({ effectiveType: '2g' })).toBe(300);
  });

  it('should return 500 for slow-2g', () => {
    expect(getPreloadDelay({ effectiveType: 'slow-2g' })).toBe(500);
  });
});
