/**
 * Bolt case study clips (moved here from tools/clips, 2026-11-19). One composition per clip; each
 * clip's timings are the T table at the top of its file (Lavanya gives changes as numbers in chat).
 * `variant` switches the shape: wide 2:1 (desktop panels), tall 4:5 (features, and phone panels on
 * phones), square (decision 02 and the edge-case screens). `npm run render -- <id> [shapes]` writes
 * MP4s and posters to ../public/work/bolt/; `npm run stills` the edge-case screens.
 */
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import { Composition, Folder, Still as StillComp } from 'remotion';
import { VARIANTS, type Variant } from './phone/engine';
import { clipSchema } from './phone/schema';
import { Fleet, fleetSchema } from './bolt/Fleet';
import { Menu } from './bolt/Menu';
import { Geofence } from './bolt/Geofence';
import { Devices } from './bolt/Devices';
import { Poi } from './bolt/Poi';
import { Subscriptions } from './bolt/Subscriptions';
import { GeofenceSlider, Still, Terrain, Vehicle, stillSchema } from './bolt/Decisions';

// size from the shape, length from `duration`
const fit = <P extends { variant: Variant; duration: number }>({ props }: { props: P }) => ({
  width: VARIANTS[props.variant].w,
  height: VARIANTS[props.variant].h,
  durationInFrames: Math.max(1, Math.round(props.duration * 30)),
});
const fitStill = <P extends { variant: Variant }>({ props }: { props: P }) => ({
  width: VARIANTS[props.variant].w,
  height: VARIANTS[props.variant].h,
});

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="Bolt">
      <Composition
        id="menu"
        component={Menu}
        schema={clipSchema}
        calculateMetadata={fit}
        durationInFrames={393}
        fps={30}
        width={1600}
        height={800}
        defaultProps={{ variant: 'tall', background: '#faf7ff', duration: 13.1 }}
      />
      <Composition
        id="fleet"
        component={Fleet}
        schema={fleetSchema}
        calculateMetadata={fit}
        durationInFrames={510}
        fps={30}
        width={1600}
        height={800}
        defaultProps={{
          variant: 'wide',
          background: '#faf7ff',
          duration: 9.63,
          carSpeed: 4,
          tapCar: 1.27,
          sheetInSeconds: 0.7,
          sheetUpStart: 3.17,
          sheetUpSeconds: 1.2,
          tapSheet: 7.53,
          sheetOutSeconds: 1,
          zoom: 1.35,
          zoomInSeconds: 0.7,
          zoomArrivesBefore: 0.4,
          zoomOutSeconds: 1.7,
        }}
      />
      <Composition
        id="geofence"
        component={Geofence}
        schema={clipSchema}
        calculateMetadata={fit}
        durationInFrames={234}
        fps={30}
        width={1600}
        height={800}
        defaultProps={{ variant: 'tall', background: '#faf7ff', duration: 14.33 }}
      />
      <Composition
        id="devices"
        component={Devices}
        schema={clipSchema}
        calculateMetadata={fit}
        durationInFrames={195}
        fps={30}
        width={1600}
        height={800}
        defaultProps={{ variant: 'tall', background: '#faf7ff', duration: 14.25 }}
      />
      <Composition
        id="poi"
        component={Poi}
        schema={clipSchema}
        calculateMetadata={fit}
        durationInFrames={195}
        fps={30}
        width={1600}
        height={800}
        defaultProps={{ variant: 'tall', background: '#faf7ff', duration: 13.88 }}
      />
      <Composition
        id="subscriptions"
        component={Subscriptions}
        schema={clipSchema}
        calculateMetadata={fit}
        durationInFrames={183}
        fps={30}
        width={1600}
        height={800}
        defaultProps={{ variant: 'tall', background: '#faf7ff', duration: 14.43 }}
      />
      <Composition
        id="geofence-slider"
        component={GeofenceSlider}
        schema={clipSchema}
        calculateMetadata={fit}
        durationInFrames={180}
        fps={30}
        width={1600}
        height={800}
        defaultProps={{ variant: 'square', background: '#faf7ff', duration: 6 }}
      />
      <Composition
        id="terrain"
        component={Terrain}
        schema={clipSchema}
        calculateMetadata={fit}
        durationInFrames={135}
        fps={30}
        width={1600}
        height={800}
        defaultProps={{ variant: 'square', background: '#faf7ff', duration: 9 }}
      />
      <Composition
        id="vehicle"
        component={Vehicle}
        schema={clipSchema}
        calculateMetadata={fit}
        durationInFrames={144}
        fps={30}
        width={1600}
        height={800}
        defaultProps={{ variant: 'tall', background: '#faf7ff', duration: 9.63 }}
      />
      <StillComp
        id="low-balance"
        component={Still}
        schema={stillSchema}
        calculateMetadata={fitStill}
        width={900}
        height={1860}
        defaultProps={{ variant: 'phone', background: 'transparent', duration: 1, src: 'bolt/subs/low-balance.png' }}
      />
      <StillComp
        id="grace-period"
        component={Still}
        schema={stillSchema}
        calculateMetadata={fitStill}
        width={900}
        height={1860}
        defaultProps={{ variant: 'phone', background: 'transparent', duration: 1, src: 'bolt/subs/grace-period.png' }}
      />
    </Folder>
  );
};
