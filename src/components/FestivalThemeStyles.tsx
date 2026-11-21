'use client';

import dynamic from 'next/dynamic';
import type { FestivalTheme } from '@/lib/festival-theme';

const DiwaliStyles = dynamic(() => import('./festival-styles/DiwaliStyles'), { ssr: false });
const RegionalStyles = dynamic(() => import('./festival-styles/RegionalStyles'), { ssr: false });
const HarvestStyles = dynamic(() => import('./festival-styles/HarvestStyles'), { ssr: false });
const GlobalPersonalStyles = dynamic(() => import('./festival-styles/GlobalPersonalStyles'), { ssr: false });
const NationalDaysStyles = dynamic(() => import('./festival-styles/NationalDaysStyles'), { ssr: false });
const SpringRegionalStyles = dynamic(() => import('./festival-styles/SpringRegionalStyles'), { ssr: false });
const CampaignStyles = dynamic(() => import('./festival-styles/CampaignStyles'), { ssr: false });
const CustomStyles = dynamic(() => import('./festival-styles/CustomStyles'), { ssr: false });

export function FestivalThemeStyles({ theme }: { theme: FestivalTheme }) {
  const preset = theme.source === 'custom' ? theme.basePresetId || '' : theme.presetId || '';

  if (preset === 'diwali' || preset === 'dhanteras') return <DiwaliStyles />;
  if (
    [
      'raksha-bandhan',
      'ganesh-chaturthi',
      'navratri',
      'durga-puja',
      'dussehra',
      'janmashtami',
      'ugadi-gudi-padwa',
    ].includes(preset)
  ) {
    return <RegionalStyles />;
  }
  if (['pongal', 'makar-sankranti', 'lohri', 'onam', 'baisakhi', 'bihu'].includes(preset)) {
    return <HarvestStyles />;
  }
  if (
    [
      'valentines-day',
      'new-year',
      'mothers-day',
      'fathers-day',
      'friendship-day',
      'childrens-day',
    ].includes(preset)
  ) {
    return <GlobalPersonalStyles />;
  }
  if (['independence-day', 'republic-day'].includes(preset)) {
    return <NationalDaysStyles />;
  }
  if (preset === 'holi') {
    return <SpringRegionalStyles />;
  }
  if (['christmas', 'eid-al-fitr', 'eid-al-adha', 'ramadan', 'easter'].includes(preset)) {
    return <CampaignStyles />;
  }
  if (theme.source === 'custom' || preset === 'custom') {
    return <CustomStyles />;
  }

  return null;
}
